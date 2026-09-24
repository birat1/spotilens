# Setup

Remember to setup an `.env` file using the example file given.  
The redirect URI needs to be the same as the one set on your app dashboard.  
A random session secret needs to be generated for cookie handling.

1. **Install Dependencies**:

    ```bash
    uv sync
    ```

2. **Run the backend**:

    ```sh
    uv run uvicorn app.main:app --reload
    ```
