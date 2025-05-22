import json
import os

def merge_c1_offers():
    data_folder = 'data'
    output_file = os.path.join(data_folder, 'c1-offers.json')
    
    # Initialize the structure to retain offers.standard.offers
    merged_data_structure = {
        "offers": {
            "standard": {
                "offers": []
            }
        }
    }
    extracted_offers_list = merged_data_structure["offers"]["standard"]["offers"]

    # Ensure the data folder exists
    if not os.path.isdir(data_folder):
        print(f"Error: Directory '{data_folder}' not found.")
        return

    print(f"Scanning files in '{data_folder}' directory...")

    for filename in os.listdir(data_folder):
        if filename.startswith('c1-offers-') and filename.endswith('.json'):
            file_path = os.path.join(data_folder, filename)
            print(f"Processing file: {file_path}")
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Navigate to the offers list
                current_level = data
                path_keys = ['offers', 'standard', 'offers']
                found = True
                for key in path_keys:
                    if isinstance(current_level, dict) and key in current_level:
                        current_level = current_level[key]
                    else:
                        print(f"  Warning: Path '{'.'.join(path_keys)}' not found in {filename}.")
                        found = False
                        break
                
                if found and isinstance(current_level, list):
                    extracted_offers_list.extend(current_level)
                    print(f"  Extracted {len(current_level)} offers from {filename}.")
                elif found:
                    print(f"  Warning: Expected a list at '{'.'.join(path_keys)}' in {filename}, but found {type(current_level)}.")

            except json.JSONDecodeError:
                print(f"  Error: Could not decode JSON from {filename}.")
            except Exception as e:
                print(f"  An unexpected error occurred while processing {filename}: {e}")

    if not extracted_offers_list:
        print("No offers were extracted. The output file will reflect the empty structure or not be created if preferred.")
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(merged_data_structure, f, indent=4)
        print(f"\nSuccessfully merged {len(extracted_offers_list)} offers into {output_file} while retaining the 'offers.standard.offers' structure.")
    except Exception as e:
        print(f"\nError writing to output file {output_file}: {e}")

if __name__ == '__main__':
    merge_c1_offers()