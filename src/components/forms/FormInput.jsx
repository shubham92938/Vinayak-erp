import { forwardRef } from 'react'
import Input from '../ui/Input/Input'
import { useFormField } from './FormFieldContext'
import './forms.css'

const FormInput = forwardRef(function FormInput(
  { id, ...props },
  ref,
) {
  const field = useFormField()

  return (
    <Input
      ref={ref}
      id={id || field?.id}
      aria-invalid={field?.invalid || undefined}
      aria-required={field?.required || undefined}
      aria-describedby={field?.describedBy}
      {...props}
    />
  )
})

FormInput.displayName = 'FormInput'

export default FormInput
