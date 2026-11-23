import { forwardRef } from 'react'
import Select from '../ui/Select/Select'
import { useFormField } from './FormFieldContext'
import './forms.css'

const FormSelect = forwardRef(function FormSelect(
  { id, options = [], placeholder = 'Select an option', ...props },
  ref,
) {
  const field = useFormField()

  return (
    <Select
      ref={ref}
      id={id || field?.id}
      options={options}
      placeholder={placeholder}
      aria-invalid={field?.invalid || undefined}
      aria-required={field?.required || undefined}
      aria-describedby={field?.describedBy}
      {...props}
    />
  )
})

FormSelect.displayName = 'FormSelect'

export default FormSelect
