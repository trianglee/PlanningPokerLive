from flask import Flask
from flask import send_from_directory
from flask.ext.cors import CORS

app = Flask(__name__)
CORS(app)

# Serve static files.
@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('../', path)

if __name__ == "__main__":

    # FIXME: IT IS DANGEROUS TO HAVE FLASK IN DEBUG MODE AND ACCESSIBLE BY THE OUTSIDE WORLD!
    app.debug = True
    app.run(host="0.0.0.0", port=20555)
    #app.run(host="127.0.0.1", port=20555)
