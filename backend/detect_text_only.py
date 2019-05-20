# Import required modules
import argparse
import math
import numpy as np

import cv2 as cv
from flask import Flask, request, redirect, url_for, flash
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = '/path/to/the/uploads'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

app = Flask(__name__)

# parser = argparse.ArgumentParser(
#     description='Use this script to run text detection deep learning networks using OpenCV.')
# # Input argument
# parser.add_argument('--input',
#                     help='Path to input image or video file. Skip this argument to capture frames from a camera.')
# # Model argument
# parser.add_argument('--model', default="frozen_east_text_detection.pb",
#                     help='Path to a binary .pb file of model contains trained weights.'
#                     )
#
# # Non-maximum suppression threshold
# parser.add_argument('--nms', type=float, default=0.4,
#                     help='Non-maximum suppression threshold.'
#                     )
#
# args = parser.parse_args()
#
#
# ############ Utility functions ############
# def decode(scores, geometry, scoreThresh):
#     detections = []
#     confidences = []
#
#     height = scores.shape[2]
#     width = scores.shape[3]
#     for y in range(0, height):
#
#         # Extract data from scores
#         scoresData = scores[0][0][y]
#         x0_data = geometry[0][0][y]
#         x1_data = geometry[0][1][y]
#         x2_data = geometry[0][2][y]
#         x3_data = geometry[0][3][y]
#         anglesData = geometry[0][4][y]
#         for x in range(0, width):
#             score = scoresData[x]
#
#             # If score is lower than threshold score, move to next x
#             if (score < scoreThresh):
#                 continue
#
#             # Calculate offset
#             offsetX = x * 4.0
#             offsetY = y * 4.0
#             angle = anglesData[x]
#
#             # Calculate cos and sin of angle
#             cosA = math.cos(angle)
#             sinA = math.sin(angle)
#             h = x0_data[x] + x2_data[x]
#             w = x1_data[x] + x3_data[x]
#
#             # Calculate offset
#             offset = (
#             [offsetX + cosA * x1_data[x] + sinA * x2_data[x], offsetY - sinA * x1_data[x] + cosA * x2_data[x]])
#
#             # Find points for rectangle
#             p1 = (-sinA * h + offset[0], -cosA * h + offset[1])
#             p3 = (-cosA * w + offset[0], sinA * w + offset[1])
#             center = (0.5 * (p1[0] + p3[0]), 0.5 * (p1[1] + p3[1]))
#             detections.append((center, (w, h), -1 * angle * 180.0 / math.pi))
#             confidences.append(float(score))
#
#     # Return detections and confidences
#     return [detections, confidences]
#
#
# width = 640;
# height = 640;
# thr = 0.3;
#
# if __name__ == "__main__":
#     # Read and store arguments
#     confThreshold = thr
#     nmsThreshold = args.nms
#     inpWidth = width
#     inpHeight = height
#     model = args.model
#
#     # Load network
#     net = cv.dnn.readNet(model)
#
#     # Create a new named window
#     kWinName = "EAST: An Efficient and Accurate Scene Text Detector"
#     cv.namedWindow(kWinName, cv.WINDOW_NORMAL)
#     outputLayers = []
#     outputLayers.append("feature_fusion/Conv_7/Sigmoid")
#     outputLayers.append("feature_fusion/concat_3")
#
#     # Open a video file or an image file or a camera stream
#     frame = cv.imread('test.jpg')
#
#     frame_test = np.zeros(frame.shape, dtype = "uint8")
#
#
#     # Get frame height and width
#     height_ = frame.shape[0]
#     width_ = frame.shape[1]
#     rW = width_ / float(inpWidth)
#     rH = height_ / float(inpHeight)
#
#     # Create a 4D blob from frame.
#     blob = cv.dnn.blobFromImage(frame, 1.0, (inpWidth, inpHeight), (123.68, 116.78, 103.94), True, False)
#
#     # Run the model
#     net.setInput(blob)
#     output = net.forward(outputLayers)
#     t, _ = net.getPerfProfile()
#     label = 'Inference time: %.2f ms' % (t * 1000.0 / cv.getTickFrequency())
#
#     # Get scores and geometry
#     scores = output[0]
#     geometry = output[1]
#     [boxes, confidences] = decode(scores, geometry, confThreshold)
#     # Apply NMS
#     indices = cv.dnn.NMSBoxesRotated(boxes, confidences, confThreshold, nmsThreshold)
#
#     points = [];
#     for i in indices:
#         # get 4 corners of the rotated rect
#         v = cv.boxPoints(boxes[i[0]])
#         # scale the bounding box coordinates based on the respective ratios
#         for j in range(4):
#             v[j][0] *= rW
#             v[j][1] *= rH
#
#         min = [-1, -1]
#         max = [-1, -1]
#         for j in range(4):
#             if min[0] == -1:
#                 min[0] = v[j][0]
#             elif v[j][0] < min[0]:
#                 min[0] = v[j][0]
#
#             if min[1] == -1:
#                 min[1] = v[j][1]
#             elif v[j][1] < min[1]:
#                 min[1] = v[j][1]
#
#             if max[0] == -1:
#                 max[0] = v[j][0]
#             elif v[j][1] > min[1]:
#                 max[0] = v[j][0]
#
#             if max[1] == -1:
#                 max[1] = v[j][1]
#             elif v[j][1] > min[1]:
#                 max[1] = v[j][1]
#
#             p1 = (v[j][0], v[j][1])
#             p2 = (v[(j + 1) % 4][0], v[(j + 1) % 4][1])
#             cv.line(frame, p1, p2, (0, 255, 0), 2, cv.LINE_AA);
#
#         cv.rectangle(frame, tuple(min), tuple(max), (0, 0, 255), 3)
#
#         cv.rectangle(frame_test, tuple(min), tuple(max), (0, 0, 255), 3)
#         cv.circle(frame_test, tuple(min), 3, (255, 255, 255), 2)
#         cv.circle(frame_test, tuple(max), 3, (255, 255, 255), 2)
#
#         points.append([tuple(min), tuple(max)])
#
#     # Put efficiency information
#     cv.putText(frame, label, (0, 155), cv.FONT_HERSHEY_SIMPLEX, 5, (0, 0, 255))
#
#     print(points);
#
#     # Display the frame
#     cv.imshow(kWinName, frame)
#     frame_test = cv.resize(frame_test, None, fx=0.4, fy=0.4)
#     cv.imshow('test', frame_test)
#
#
#     cv.waitKey(0)
#     cv.destroyAllWindows()


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            return {'message': 'there is no file'}
        file = request.files['file']
        if file.filename == '':
            return {'message': 'No selected file'}
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)

            print(filename)
            return {'message': 'done'}

if __name__ == '__main__':
     app.run(port='5002')