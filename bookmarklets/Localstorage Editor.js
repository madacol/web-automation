// @name Localstorage Editor
// @description Prompts the user for the key to extract, edit or insert into LocalStorage

const saved_keys = Object.keys(localStorage);
const key = prompt('Enter LocalStorage\'s key to edit or insert:\n\nAvailable keys to edit:\n' + saved_keys.join('\n'), '');
if (key) {
    const value = localStorage.getItem(key);
    const newValue = prompt('Current value (copy it or paste a new one):', value);
    if (newValue && newValue !== value) {
        localStorage.setItem(key, newValue);
        alert('Saved!');
    }
}