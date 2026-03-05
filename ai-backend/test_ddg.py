from ddgs import DDGS

def test_chat():
    try:
        ddgs = DDGS()
        result = ddgs.chat("Hello, how are you?", model="gpt-4o-mini")
        print("Success!")
        print("Response:", result)
    except Exception as e:
        print(f"Error: {type(e).__name__}: {e}")

if __name__ == "__main__":
    test_chat()
