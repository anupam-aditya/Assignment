# Technical Design Document

### Overview

The code in this repository is a Node.js application that processes CSV files containing product information and image URLs. The application allows users to upload a CSV file, and it then compresses the images, stores the processed data, and provides an API to retrieve the status of the processing.

### System Architecture

The system consists of the following components:

1. **Express.js Server**
   The server is built using the Express.js framework and handles the incoming HTTP requests.
   It provides two main endpoints:
   /upload: Handles the CSV file upload and processes the data.
   /status/:requestID: Retrieves the status of the processing for a specific request.
2. **CSV Processing**
   The CSV file is parsed using the csv-parser library.
   The product data, including the serial number, product name, and input image URLs, is extracted from the CSV file.
   The input image URLs are processed, and the compressed images are saved to the file system.
   The processed data, including the output image URLs, is stored in a JSON file.
3. **Image Compression**
   The image compression is handled using the sharp library.
   The input images are resized to a width of 100 pixels and compressed to a JPEG format with a quality of 50%.
   The compressed images are then saved to the file system.
4. **File Storage**
   The processed data and the compressed images are stored in the storage directory.
   The processed data is stored in a JSON file, with the request ID as the file name.
