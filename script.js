const classes = {
  0: 'apple',
  1: 'banana',
  2: 'beef',
  3: 'blueberries',
  4: 'carrots',
  5: 'chicken_wings',
  6: 'egg',
  7: 'honey',
  8: 'mushrooms',
  9: 'strawberries'
};

// Check to see if TF.js is available 
const tfjs_status = document.getElementById("tfjs_status");

if (tfjs_status) {
  tfjs_status.innerText = "Loaded TensorFlow.js - version:" + tf.version.tfjs;
}


// Model loading
let model; // This is in global scope

const loadModel = async () => {
  try {
    const tfliteModel = await tflite.loadTFLiteModel(
      "https://storage.googleapis.com/food-vision-models-test/10_whole_foods_model_v0.tflite"
      // "code/twitch-ml-deploy/10_whole_foods_model_v0.tflite"
    );
    model = tfliteModel; // assigning it to the global scope model as tfliteModel can only be used within this scope
    // console.log(tfliteModel);

    //  Check if model loaded
    if (tfliteModel) {
      model_status.innerText = "Model loaded";
    }
  } catch (error) {
    console.log(error);
  }
};

loadModel();

// Function to classify image
function classifyImage(model, image) {
  // Preprocess image
  image = tf.image.resizeBilinear(image, [224, 224]); // image size needs to be same as model inputs 
  image = tf.expandDims(image);

  // console.log(tflite.getDTypeFromTFLiteType("uint8")); // Gives int32 as output thus we cast int32 in below line
  image = tf.cast(image, "int32"); // Model requires uint8
  const output = model.predict(image);
  const output_values = tf.softmax(output.arraySync()[0]);
  console.log(output.arraySync());
  console.log(output.arraySync()[0]); // arraySync() Returns an array to use

  // Update HTML
  predicted_class.innerText = classes[output_values.argMax().arraySync()];
  predicted_prob.innerText = output_values.max().arraySync() * 100 + "%";
}


// Image uploading
const fileInput = document.getElementById("file-input");
const image = document.getElementById("image");

function getImage() {
  if (!fileInput.files[0]) throw new Error("Image not found");
  const file = fileInput.files[0];

  // Get the data url from the image
  const reader = new FileReader();

  // When reader is ready display image
  reader.onload = function (event) {
    // Get data URL
    const dataUrl = event.target.result;

    // Create image object
    const imageElement = new Image();
    imageElement.src = dataUrl;

    // When image object loaded
    imageElement.onload = function () {
      // Display image
      image.setAttribute("src", this.src);

      // Log image parameters
      const currImage = tf.browser.fromPixels(imageElement);

      // Classify image
      classifyImage(model, currImage);
    };

    document.body.classList.add("image-loaded");
  };

  // Get data url
  reader.readAsDataURL(file);
}

// Add listener to see if someone uploads an image
fileInput.addEventListener("change", getImage);