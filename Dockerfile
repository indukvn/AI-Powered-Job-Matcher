FROM continuumio/miniconda3

# Set the working directory in the container
WORKDIR /app

# Install Python and required dependencies via Conda
RUN conda install -y python=3.9 scikit-learn=0.24.2 numpy=1.23.4 flask pyPDF2 python-docx nltk

# Copy the current directory contents into the container at /app
COPY . /app

# Install the remaining pip dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port that Flask will run on
EXPOSE 5000

# Run the Flask app
CMD ["python", "app.py"]
