from fastapi import FastAPI, Form

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from Python ML Service"}

@app.get("/testing")
def testing():
    return {"anotherMessage": "My name is Danny"}
