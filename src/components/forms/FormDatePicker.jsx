import { forwardRef } from 'react'
import FormInput from './FormInput'

const FormDatePicker = forwardRef(function FormDatePicker(props, ref) {
  return <FormInput ref={ref} {...props} type="date" />
})

FormDatePicker.displayName = 'FormDatePicker'

export default FormDatePicker
