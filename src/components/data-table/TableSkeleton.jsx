const WIDTHS = ['70%', '52%', '84%', '46%', '62%', '76%']

function TableSkeleton({ rows = 6, columns, selectable = false }) {
  return (
    <tbody aria-hidden="true">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr
          key={`skeleton-row-${rowIndex}`}
          className="data-table__row data-table__row--skeleton"
        >
          {selectable && (
            <td className="data-table__cell data-table__cell--select">
              <span className="data-table-skeleton__box" />
            </td>
          )}

          {columns.map((column, columnIndex) => (
            <td
              key={column.id}
              className={[
                'data-table__cell',
                column.align === 'right' &&
                  'data-table__cell--align-right',
                column.align === 'center' &&
                  'data-table__cell--align-center',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span
                className="data-table-skeleton__bar"
                style={{
                  width:
                    WIDTHS[
                      (rowIndex + columnIndex) % WIDTHS.length
                    ],
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

export default TableSkeleton
