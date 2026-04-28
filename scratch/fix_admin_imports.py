import os

def fix_imports(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.dart'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content.replace('package:hornvin_admin/admin/', 'package:hornvin_admin/')
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed imports in {path}")

if __name__ == "__main__":
    fix_imports(r'c:\Users\manve\Desktop\ttt\hornvin\admin\lib')
