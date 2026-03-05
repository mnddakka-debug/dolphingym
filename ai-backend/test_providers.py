"""Test different g4f providers"""
from g4f.client import Client
from g4f.Provider import PollinationsAI, TeachAnything, Yqcloud, BlackboxPro, Copilot, CablyAI

providers_to_test = [
    ("PollinationsAI", PollinationsAI),
    ("TeachAnything", TeachAnything),
    ("Yqcloud", Yqcloud),
    ("BlackboxPro", BlackboxPro),
    ("CablyAI", CablyAI),
]

client = Client()

for name, provider in providers_to_test:
    try:
        print(f"Testing {name}...")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Say hello in one word"}],
            provider=provider
        )
        result = response.choices[0].message.content
        print(f"  SUCCESS: {result[:50]}...")
        print(f"  USE THIS PROVIDER: {name}")
        break
    except Exception as e:
        print(f"  FAILED: {e}")
