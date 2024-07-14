#### API Documentation

1. POST /upload
   **Description:** Uploads a CSV file containing product data and initiates the processing of the images.
   **Request Body:** file: CSV file containing product data
   **Response:** requestID: Unique identifier for the processing request

   Example Request:
   POST /upload
   Content-Type: multipart/form-data
   {
   "file": "csv_waala.csv"
   }

   Example Response:
   {
   "requestID": "f9c476d6-02b1-4aaa-8fb2-38e3f14785ef"
   }

2. GET /status/:requestID
   **Description:** Retrieves the status of a processing request and the corresponding product data.
   **Path Parameters:** requestID: Unique identifier for the processing request
   **Response:** status: Current status of the request ('pending' or 'processed')
   **productData:** Array of product data objects, including serial number, product name, input image URLs, output image URLs, and status of each product.

   Example Request:
   GET /status/f9c476d6-02b1-4aaa-8fb2-38e3f14785ef

   Example Response:
   {
   "status": "processed",
   "productData": [
   {
   "serialNumber": "1",
   "productName": "SKU1",
   "inputImageUrls": [
   "https://fastly.picsum.photos/id/1/200/300.jpg?hmac=jH5bDkLr6Tgy3oAg5khKCHeunZMHq0ehBZr6vGifPLY",
   "https://fastly.picsum.photos/id/1/200/300.jpg?hmac=jH5bDkLr6Tgy3oAg5khKCHeunZMHq0ehBZr6vGifPLY"
   ],
   "outputImageUrls": [
   "/1-f9c476d6-02b1-4aaa-8fb2-38e3f14785ef.jpg",
   "/1-f9c476d6-02b1-4aaa-8fb2-38e3f14785ef.jpg"],
   "status": "processed"
   },
   {
   "serialNumber": "2",
   "productName": "SKU2",
   "inputImageUrls": [
   "https://fastly.picsum.photos/id/1/200/300.jpg?hmac=jH5bDkLr6Tgy3oAg5khKCHeunZMHq0ehBZr6vGifPLY",
   "https://fastly.picsum.photos/id/1/200/300.jpg?hmac=jH5bDkLr6Tgy3oAg5khKCHeunZMHq0ehBZr6vGifPLY"
   ],
   "outputImageUrls": [
   "/2-f9c476d6-02b1-4aaa-8fb2-38e3f14785ef.jpg",
   "/2-f9c476d6-02b1-4aaa-8fb2-38e3f14785ef.jpg"
   ],
   "status": "processed"
   }
   ]
   }

#### Asynchronous Workers Documentation

To handle the image processing asynchronously and improve the responsiveness of the upload API, we have used asynchronous workers. Here's a description of the worker functions:

1. **Image Processing Worker:**
   (i)Listens for new processing requests in the queue.
   (ii)Retrieves the product data for the request from the database.
   (iii)Processes the input images for each product:
   (iv)Compresses the images using the sharp library.
   (v)Saves the compressed images to the file system.
   (vi)Updates the output_image_urls and status columns in the products table.
   (vii)Updates the status column in the requests table to 'processed'.
2. **Database Update Worker:**
   (i)Listens for database update requests in the queue.
   (ii)Performs the necessary updates to the database, such as inserting new records or updating existing ones.
   (iii)Sends a confirmation message upon successful completion of the update.
   (iv)These worker functions can be implemented using a message queue system like RabbitMQ or Apache Kafka. The main application would submit processing and database update requests to the queue, and the workers would process these requests asynchronously in the background.
   (v)By using asynchronous workers, the upload API can return the request ID immediately, and the processing can be performed in the background without blocking the main application.
