import { forwardRef } from 'react'
import Textarea from '../ui/Textarea/Textarea'
import { useFormField } from './FormFieldContext'
import './forms.css'

const FormTextarea = forwardRef(function FormTextarea(
  { id, rows = 4, ...props },
  ref,
) {
  const field = useFormField()

  return (
    <Textarea
      ref={ref}
      id={id || field?.id}
      rows={rows}
      aria-invalid={field?.invalid || undefined}
      aria-required={field?.required || undefined}
      aria-describedby={field?.describedBy}
      {...props}
    />
  )
})

FormTextarea.displayName = 'FormTextarea'

export default FormTextarea
