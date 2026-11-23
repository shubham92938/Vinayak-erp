import { Search } from 'lucide-react'
import Input from '../ui/Input/Input'
import './filters.css'

function SearchInput({
  value,
  onChange,
  label = 'Search',
  placeholder = 'Search records...',
  size = 'sm',
  containerClassName = '',
  ...props
}) {
  return (
    <Input
      type="search"
      size={size}
      leadingIcon={<Search size={15} />}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      aria-label={label}
      containerClassName={[
        'search-input',
        containerClassName,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

export default SearchInput
