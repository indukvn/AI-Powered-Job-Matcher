FROM python:3.9-slim

# Install system dependencies for building scipy and other libraries
RUN apt-get update && \
    apt-get install -y build-essential gfortran libatlas-base-dev

# Install Python dependencies
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install -r requirements.txt

# Set the working directory and expose the port
WORKDIR /app
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
