from app import app


@app.errorhandler(500)
def errorhandler(status_code):
    status_code = status_code if isinstance(status_code, int) else 500
    return {'message': 'something went wrong'}, status_code
