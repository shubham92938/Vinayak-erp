import './forms.css'

function FormGrid({ columns = 2, className = '', children, ...props }) {
  const columnCount = [1, 2, 3].includes(Number(columns))
    ? Number(columns)
    : 2

  return (
    <div
      className={[
        'form-grid',
        `form-grid--${columnCount}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export default FormGrid
