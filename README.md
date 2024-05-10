
# react-tools

Welcome to `react-tools`, a set of simple and intuitive utilities for developing React applications. This package includes key tools that can streamline your development process.

## Contents

### Main Utilities:

- `useDebounce`: A custom hook that adds debounce functionality to events and functions to improve your application's performance.
- `<Input />`: A reusable input component that provides a consistent user experience.

## Installation

To install `react-tools`, use the following command with `pnpm`:

```bash
pnpm i @galiprandi/react-tools
```

## Basic Usage

### Example with `useDebounce`

```js
import { useDebounce } from '@galiprandi/react-tools';
import { useState } from 'react';

function DebouncedSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebounce(searchTerm, 500);

  // Perform a search with the debouncedTerm
  // ...

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}
```

### Example with `<Input />`

```js
import { Input } from '@galiprandi/react-tools';

function Form() {
  const handleInputChange = (value) => {
    // Logic for handling data
  };

  return (
    <form>
      <Input
        label="Name"
        value=""
        onChange={handleInputChange}
      />
    </form>
  );
}
```

## Contribution

Contributions are welcome! To contribute:

1. Fork this repository.
2. Create a branch with a meaningful description.
3. Make the desired changes.
4. Open a Pull Request to the main branch.

If you find an issue or have a suggestion to improve the project, feel free to open an issue.

## License

This project is licensed under the MIT License.
