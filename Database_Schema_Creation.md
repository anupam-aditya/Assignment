# Database Schema

#### To store the product data and track the status of each processing request, we have used the following database schema:

1. SQL commands to create the schema

```sql
CREATE TABLE requests (
id UUID PRIMARY KEY,
status VARCHAR(20) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);	CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  request_id UUID NOT NULL,
  serial_number VARCHAR(50) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  input_image_urls TEXT[] NOT NULL,
  output_image_urls TEXT[],
  status VARCHAR(20) NOT NULL,
  FOREIGN KEY (request_id) REFERENCES requests(id)
);
```

#### The schema consists of two tables:

1. **requests:**
   id: Unique identifier for the request (UUID).
   status: Current status of the request ('pending' or 'processed').
   created_at: Timestamp of when the request was created.
2. **products:**
   id: Unique identifier for the product (auto-incrementing serial number).
   request_id: Foreign key referencing the id column in the requests table.
   serial_number: Serial number of the product.
   product_name: Name of the product.
   input_image_urls: Array of input image URLs.
   output_image_urls: Array of output (compressed) image URLs.
   status: Current status of the product ('pending' or 'processed').

The requests table stores information about each processing request, including its status and creation timestamp. The products table stores the product data associated with each request, including the input and output image URLs and the status of each product.
The request_id foreign key in the products table links each product to its corresponding request in the requests table.
