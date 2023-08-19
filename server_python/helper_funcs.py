

RUN_TESTS = True



def test_decorator(func):
    """
    This decorator will make sure the returned function will run only during testing of this module
    """
    # print(__name__)

    def inner(*args, **kwargs):
        if __name__ == "__main__" and RUN_TESTS:
            func(*args, **kwargs)

    return inner





def print_dict(d):
    print("{")
    for k, v in d.items():
        print("{0}:{1}".format(k, v))
    print("}")
