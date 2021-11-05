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

const tfjs_status = document.getElementById("status");

if (tfjs_status) {
  tfjs_status.innerText = `Loaded TensorFlow.js - version:${tf.version.tfjs}`;
}

// // This is from: https://www.jsdelivr.com/package/npm/@tensorflow/tfjs-tflite
// // Load model from URL
// const tfliteModel = tflite.loadTFLiteModel(
//     // URL to storage of model
//     "https://storage.googleapis.com/food-vision-models-test/10_whole_foods_model_v0.tflite"

// )

let model; // This is in global scope

const loadModel = async () => {
  try {
    const tfliteModel = await tflite.loadTFLiteModel(
      "/10_whole_foods_model_v0.tflite"
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

  // // Prepare input tensors.
  // const img = tf.browser.fromPixels(document.querySelector('img'));
  // const input = tf.sub(tf.div(tf.expandDims(img), 127.5), 1);

  // // Run inference and get output tensors.
  // let outputTensor = tfliteModel.predict(input);
  // console.log(outputTensor.dataSync());
};
loadModel();

// Function to classify image
function classifyImage(model, image) {
  image = tf.image.resizeBilinear(image, [224, 224]); // resizing image
  image = tf.expandDims(image);

  // console.log(tflite.getDTypeFromTFLiteType("uint8")); // Gives int32 as output thus we cast int32 in below line
  image = tf.cast(image, "int32"); // Model required uint8
  const output = model.predict(image);
  console.log(output);
  console.log(output.arraySync()); // Returns an array to use
  console.log(output.arraySync()[0]);
  const output_values = output.arraySync();
  console.log(classes[4])
  predicted_class.innerText = classes[tf.softmax(output_values[0]).argMax().arraySync()];
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

   // console.log(tf.browser.fromPixels(fileInput.files[0]).print());

   // console.log(tf.browser.fromPixels(document.querySelector("image")));

   // const test_image = new ImageData(1, 1);
   // test_image.data[0] = 100;
   // test_image.data[1] = 150;
   // test_image.data[2] = 200;
   // test_image.data[3] = 255;

   // tf.browser.fromPixels(test_image).print();
