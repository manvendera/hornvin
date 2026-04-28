import os

def fix_distributor_constants(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.dart'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content.replace('ApiConstants.', 'DistributorApiConstants.')
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed constants in {path}")

if __name__ == "__main__":
    fix_distributor_constants(r'c:\Users\manve\Desktop\ttt\hornvin\distributor\lib')
