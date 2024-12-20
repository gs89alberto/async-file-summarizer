# Async File Summarizer

**Async File Summarizer** is an application that allows you to upload text-based files (TXT, PDF, MD) and have them asynchronously summarized by leveraging Large Language Models (LLMs). It provides endpoints to submit files, check job status, retrieve summaries once completed, and get all jobs with filters.

## Requirements

- **Docker & Docker Compose**:  
    Ensure you have Docker and Docker Compose installed on your system.  
    [Install Docker](https://docs.docker.com/get-docker/)

- **Google Cloud CLI (gcloud)**:  
    If you plan to integrate with Vertex AI or Google Cloud Storage, you need the `gcloud` CLI installed.  
    [Install gcloud CLI](https://cloud.google.com/sdk/docs/install)

    After installing `gcloud`, you’ll need to authenticate and generate a credential file:
    ```bash
    gcloud auth application-default login
    ```

    This creates a credential file (typically at `~/.config/gcloud/application_default_credentials.json`) which can be mounted into the container or used within your environment to access Vertex AI or storage APIs.

## Environment Setup

Create a `.env` file at the project root to provide environment variables. For example:

```plaintext
POSTGRES_DB=your_database
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
REDIS_PORT=6379
PORT=3000
```

### Google Storage / Vertex AI vars

```plaintext
STORAGE_URL=https://storage.googleapis.com/your-bucket
GS_BUCKET_NAME=your-bucket
GS_LOCATION=your-gcp-region
GS_PROJECT_ID=your-gcp-project-id
```

## Endpoints

1. **POST api/jobs/files**  
     Upload a file to start a summarization job. The request should contain the file (file field in form-data) and any other necessary parameters.

2. **GET api/jobs/:jobId**  
     Check the status of a specific job by its ID. Returns the current state (e.g., pending, processing, completed, failed).

3. **GET api/jobs/summaries/:jobId**  
     Once a job is completed, retrieve the summarized content using this endpoint.

4. **GET api/jobs**  
     Retrieve all jobs, optionally filtered by status via query parameters, and paginated using `page` and `pageSize`.

## Postman Collection

A Postman collection is provided to simplify testing these endpoints. You can import this collection into Postman and quickly send requests to the running application:
- **Postman Collections**: `/docs/Async File Summarizer.postman_collection.json`

## Running the Project with Docker

```bash
docker-compose up --build
```

Docker Compose will:
- Start the `app` container running the Node.js application.
- Start the `db` container running PostgreSQL.
- Start the `redis` container for queues.

The application will be accessible at [http://localhost:3000](http://localhost:3000) (adjust the port if changed in the `.env`).