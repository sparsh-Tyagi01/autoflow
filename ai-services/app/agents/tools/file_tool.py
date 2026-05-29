def read_file_tool(
    path: str
):

    try:
        with open(path, "r") as f:
            return f.read()

    except Exception as e:
        return str(e)