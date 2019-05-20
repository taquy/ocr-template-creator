import cv2 as cv
import math
from PIL import Image
import base64
import io
import numpy as np
import os.path

CWD = os.path.abspath(os.path.dirname(__file__))

ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
MODEL = '../model/frozen_east_text_detection.pb'
WIDTH = 1280
HEIGHT = 1280
THR = 0.7

# Non-maximum suppression threshold.
NMS = 0.3


class TextDetector:
    def __init__(self):
        global THR, NMS

        self.net = None
        self.thr_conf = THR
        self.thr_nms = NMS

        self.output_layers = []
        self.output_layers.append("feature_fusion/Conv_7/Sigmoid")
        self.output_layers.append("feature_fusion/concat_3")

        # load model
        self.load()

    def load(self):
        global MODEL, CWD
        model_path = os.path.join(CWD, MODEL)
        self.net = cv.dnn.readNet(model_path)

    def decode(self, scores, geometry, scoreThresh):
        detections = []
        confidences = []

        height = scores.shape[2]
        width = scores.shape[3]
        for y in range(0, height):

            # Extract data from scores
            scoresData = scores[0][0][y]
            x0_data = geometry[0][0][y]
            x1_data = geometry[0][1][y]
            x2_data = geometry[0][2][y]
            x3_data = geometry[0][3][y]
            anglesData = geometry[0][4][y]
            for x in range(0, width):
                score = scoresData[x]

                # If score is lower than threshold score, move to next x
                if (score < scoreThresh):
                    continue

                # Calculate offset
                offsetX = x * 4.0
                offsetY = y * 4.0
                angle = anglesData[x]

                # Calculate cos and sin of angle
                cosA = math.cos(angle)
                sinA = math.sin(angle)
                h = x0_data[x] + x2_data[x]
                w = x1_data[x] + x3_data[x]

                # Calculate offset
                offset = (
                    [offsetX + cosA * x1_data[x] + sinA * x2_data[x], offsetY - sinA * x1_data[x] + cosA * x2_data[x]])

                # Find points for rectangle
                p1 = (-sinA * h + offset[0], -cosA * h + offset[1])
                p3 = (-cosA * w + offset[0], sinA * w + offset[1])
                center = (0.5 * (p1[0] + p3[0]), 0.5 * (p1[1] + p3[1]))
                detections.append((center, (w, h), -1 * angle * 180.0 / math.pi))
                confidences.append(float(score))

        # Return detections and confidences
        return [detections, confidences]

    def findMinMax(self, v):
        min = [-1, -1]
        max = [-1, -1]
        for j in range(4):
            if min[0] == -1:
                min[0] = v[j][0]
                min[1] = v[j][1]
                max[0] = v[j][0]
                max[1] = v[j][1]

            if v[j][0] < min[0]:
                min[0] = v[j][0]

            if v[j][1] < min[1]:
                min[1] = v[j][1]

            if v[j][1] > min[1]:
                max[0] = v[j][0]

            if v[j][1] > min[1]:
                max[1] = v[j][1]

        return [tuple(min), tuple(max)]

    def collectPoints(self, indices, frame, boxes):
        global WIDTH, HEIGHT

        # Read and store arguments
        iw = WIDTH
        ih = HEIGHT

        # Get frame height and width
        height_ = frame.shape[0]
        width_ = frame.shape[1]
        rw = width_ / float(iw)
        rh = height_ / float(ih)

        points = []
        for i in indices:
            # get 4 corners of the rotated rect
            v = cv.boxPoints(boxes[i[0]])
            # scale the bounding box coordinates based on the respective ratios
            for j in range(4):
                v[j][0] *= rw
                v[j][1] *= rh

            points.append(self.findMinMax(v))

        return points

    def detect(self, frame):
        global WIDTH, HEIGHT
        iw = WIDTH
        ih = HEIGHT

        # create a 4D blob from frame.
        blob = cv.dnn.blobFromImage(frame, 1.0, (iw, ih), (123.68, 116.78, 103.94), True, False)

        # run the model
        self.net.setInput(blob)
        output = self.net.forward(self.output_layers)
        t, _ = self.net.getPerfProfile()

        print('Inference time: %.2f ms' % (t * 1000.0 / cv.getTickFrequency()));

        # get scores and geometry
        scores = output[0]
        geometry = output[1]
        [boxes, confidences] = self.decode(scores, geometry, self.thr_conf)

        # apply NMS
        indices = cv.dnn.NMSBoxesRotated(boxes, confidences, self.thr_conf, self.thr_nms)

        return self.collectPoints(indices, frame, boxes)


class Util:
    # Take in base64 string and return PIL image
    def stringToImage(self, base64_string):
        imgdata = base64.b64decode(base64_string)
        return Image.open(io.BytesIO(imgdata))

    # convert PIL Image to an RGB image( technically a numpy array ) that's compatible with opencv
    def toRGB(self, image):
        return cv.cvtColor(np.array(image), cv.COLOR_BGR2RGB)

    def allowed_file(self, filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
