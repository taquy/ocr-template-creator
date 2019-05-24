# Import required modules
import base64

from flask import Flask, request
from werkzeug.utils import secure_filename

from TextDetector import TextDetector, Util
import json
from flask_cors import CORS

app = Flask(__name__)

td = TextDetector()
ut = Util()

cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            return 'there is no file'

        file = request.files['file']

        if file.filename == '':
            return 'No selected file'

        if file and ut.allowed_file(file.filename):
            # get uploaded image
            filename = secure_filename(file.filename)
            image_string = base64.b64encode(file.read())
            image = ut.stringToImage(image_string)
            image = ut.toRGB(image)

            h, w, c = image.shape
            # detect text blocks
            points = td.detect(image)

            points_relative = [];

            for rect in points:
                p1 = list(rect[0])
                p2 = list(rect[1])
                points_relative.append([
                    p1[0] / w, p1[1] / h,
                    p2[0] / w, p2[1] / h,
                ])
            # cv.imshow(filename, image)
            # cv.waitKey(0)

            return json.dumps(points_relative)
        return 'invalid file'

if __name__ == '__main__':
    app.run(port='8081')
