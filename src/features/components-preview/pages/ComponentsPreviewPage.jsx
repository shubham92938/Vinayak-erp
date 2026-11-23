import { useCallback, useMemo, useState } from 'react'
import {
  Download,
  Eye,
  Info,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { DataTable } from '../../../components/data-table'
import {
  CategoryFilter,
  DateRangeFilter,
  FilterBar,
  FirmFilter,
  StatusFilter,
} from '../../../components/filters'
import {
  Badge,
  Button,
  ConfirmDialog,
  useToast,
} from '../../../components/ui'
import { SAMPLE_FIRMS } from '../../../config/firms'
import {
  buildExportFilename,
  downloadCsv,
} from '../../../utils/csv'
import RecordDetailsDrawer from '../components/RecordDetailsDrawer'
import RecordFormModal from '../components/RecordFormModal'
import {
  PREVIEW_CATEGORY_OPTIONS,
  PREVIEW_PARTY_TYPE_LABELS,
  PREVIEW_STATUS_META,
  PREVIEW_STATUS_OPTIONS,
  createPreviewRecords,
  getNextPreviewId,
} from '../data/previewData'
import { PREVIEW_CSV_COLUMNS } from '../utils/previewCsv'
import {
  countActivePreviewFilters,
  createPreviewFilters,
  filterPreviewRecords,
  matchesPreviewFilters,
} from '../utils/previewFilters'
import {
  formatPreviewCurrency,
  formatPreviewDate,
} from '../utils/format'
import './ComponentsPreviewPage.css'

const getRecordId = (record) => record.id
const getRecordLabel = (record) => record.id

// Local-only delay so the form's submitting state can be exercised without a
// network request or fake API.
const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export default function ComponentsPreviewPage() {
  const toast = useToast()
  const referenceDate = useMemo(() => new Date(), [])
  const [records, setRecords] = useState(() =>
    createPreviewRecords(referenceDate),
  )
  const [filters, setFilters] = useState(createPreviewFilters)
  const [formState, setFormState] = useState(null)
  const [detailsRecord, setDetailsRecord] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const activeFilterCount = countActivePreviewFilters(filters)
  const filteredRecords = useMemo(
    () => filterPreviewRecords(records, filters),
    [records, filters],
  )

  const tableFilter = useCallback(
    (record) => matchesPreviewFilters(record, filters),
    [filters],
  )

  const searchFields = useCallback(
    (record) => [
      record.id,
      record.party,
      record.partyTypeLabel,
      record.firmName,
      record.firmLocation,
      record.category,
      PREVIEW_STATUS_META[record.status]?.label,
      record.amount,
      record.notes,
    ],
    [],
  )

  const updateFilters = (patch) => {
    setFilters((current) => ({ ...current, ...patch }))
  }

  const resetFilters = () => {
    setFilters(createPreviewFilters())
  }

  const columns = useMemo(
    () => [
      {
        id: 'id',
        header: 'Record',
        accessor: 'id',
        width: '136px',
        cell: (record) => (
          <span className="preview-record-cell">
            <span className="preview-record-cell__id">
              {record.id}
            </span>
            <span className="preview-record-cell__type">
              {PREVIEW_PARTY_TYPE_LABELS[record.partyType] ??
                record.partyType}
            </span>
          </span>
        ),
      },
      {
        id: 'party',
        header: 'Party',
        accessor: 'party',
        minWidth: '176px',
        cell: (record) => (
          <span className="preview-party">
            <span className="preview-party__name">
              {record.party}
            </span>
            <span className="preview-party__note">
              {record.notes || 'Demo record'}
            </span>
          </span>
        ),
      },
      {
        id: 'date',
        header: 'Date',
        accessor: 'date',
        width: '118px',
        cell: (record) => (
          <time dateTime={record.date}>
            {formatPreviewDate(record.date)}
          </time>
        ),
      },
      {
        id: 'firmName',
        header: 'Firm',
        accessor: 'firmName',
        minWidth: '144px',
        cell: (record) => (
          <span className="preview-firm">
            <span>{record.firmName}</span>
            <span className="preview-firm__location">
              {record.firmLocation}
            </span>
          </span>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        accessor: 'category',
        width: '150px',
        cell: (record) => (
          <span className="preview-category">{record.category}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status',
        width: '116px',
        cell: (record) => {
          const status = PREVIEW_STATUS_META[record.status]
          return (
            <Badge variant={status?.variant ?? 'neutral'} size="sm">
              {status?.label ?? record.status}
            </Badge>
          )
        },
      },
      {
        id: 'amount',
        header: 'Amount',
        accessor: 'amount',
        align: 'right',
        width: '132px',
        cell: (record) => (
          <span className="preview-amount">
            {formatPreviewCurrency(record.amount)}
          </span>
        ),
      },
    ],
    [],
  )

  const rowActions = useCallback((record) => {
    return [
      {
        id: 'view',
        label: 'View details',
        icon: <Eye size={15} />,
        onSelect: () => setDetailsRecord(record),
      },
      {
        id: 'edit',
        label: 'Edit record',
        icon: <Pencil size={15} />,
        onSelect: () =>
          setFormState({ mode: 'edit', record }),
      },
      { type: 'separator' },
      {
        id: 'delete',
        label: 'Delete record',
        icon: <Trash2 size={15} />,
        danger: true,
        onSelect: () => setDeleteTarget(record),
      },
    ]
  }, [])

  const exportRows = useCallback(
    (rows, suffix) => {
      if (rows.length === 0) {
        toast.warning('Nothing to export', {
          description:
            'No demo records match the current search and filters.',
        })
        return
      }

      try {
        const result = downloadCsv({
          filename: buildExportFilename('vinayak-demo-records', {
            suffix,
            includeDate: true,
          }),
          columns: PREVIEW_CSV_COLUMNS,
          rows,
        })

        toast.success('CSV exported', {
          description: `${result.count} demo ${
            result.count === 1 ? 'record' : 'records'
          } saved to ${result.filename}.`,
        })
      } catch {
        toast.error('Export failed', {
          description:
            'The CSV file could not be generated in this browser.',
        })
      }
    },
    [toast],
  )

  const handleSaveRecord = async (values) => {
    const currentForm = formState

    await wait(500)

    const firm =
      SAMPLE_FIRMS.find((item) => item.id === values.firmId) ??
      SAMPLE_FIRMS[0]
    const normalized = {
      party: values.party.trim(),
      partyType: values.partyType,
      partyTypeLabel:
        PREVIEW_PARTY_TYPE_LABELS[values.partyType] ?? values.partyType,
      date: values.date,
      firmId: firm.id,
      firmName: firm.name,
      firmLocation: firm.location,
      category: values.category,
      status: values.status,
      statusLabel:
        PREVIEW_STATUS_META[values.status]?.label ?? values.status,
      amount: Number(values.amount),
      notes: values.notes?.trim() ?? '',
    }

    if (currentForm?.mode === 'edit' && currentForm.record) {
      const editedId = currentForm.record.id

      setRecords((current) =>
        current.map((record) =>
          record.id === editedId
            ? { ...record, ...normalized }
            : record,
        ),
      )
      toast.success('Demo record updated', {
        description: `${editedId} was updated in local demo state.`,
      })
    } else {
      const nextId = getNextPreviewId(records)

      setRecords((current) => [
        { id: nextId, ...normalized },
        ...current,
      ])
      resetFilters()
      toast.success('Demo record added', {
        description: `${nextId} was added to local demo state.`,
      })
    }

    setFormState(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return

    const target = deleteTarget
    setDeleting(true)

    try {
      await wait(350)

      setRecords((current) =>
        current.filter((record) => record.id !== target.id),
      )

      if (detailsRecord?.id === target.id) {
        setDetailsRecord(null)
      }

      setDeleteTarget(null)
      toast.success('Demo record deleted', {
        description: `${target.id} was removed from local demo state.`,
      })
    } catch {
      toast.error('Delete failed', {
        description: 'The demo record could not be removed.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleEditFromDetails = () => {
    const record = detailsRecord
    setDetailsRecord(null)

    if (record) {
      setFormState({ mode: 'edit', record })
    }
  }

  const emptyTitle = activeFilterCount
    ? 'No demo records match'
    : 'No demo records'
  const emptyDescription = activeFilterCount
    ? 'Try a different search or clear one of the active filters.'
    : 'Add a local demo record to populate the table.'

  return (
    <div className="components-preview">
      <header className="page-header preview-header">
        <div className="page-header__text">
          <div className="preview-header__eyebrow">
            <Badge variant="warning" size="sm" dot>
              Demo data
            </Badge>
            <span>Components / Preview</span>
          </div>

          <h1 className="page-title">Data components preview</h1>
          <p className="page-description">
            A working reference for the shared ERP table, filter, form,
            overlay, and CSV export system.
          </p>
        </div>
      </header>

      <div className="preview-notice" role="note">
        <span className="preview-notice__icon" aria-hidden="true">
          <Info size={16} />
        </span>
        <div>
          <p className="preview-notice__title">
            Internal component lab with local demo data
          </p>
          <p className="preview-notice__text">
            Records are generated in memory and are not saved or sent
            anywhere. Add, edit, delete, and export actions affect this
            page only. CSV is the only export format implemented; PDF and
            Excel export are not part of this phase.
          </p>
        </div>
      </div>

      <DataTable
        data={records}
        columns={columns}
        getRowId={getRecordId}
        getRowLabel={getRecordLabel}
        title="Demo records"
        description={`${records.length} local demo records. Changes last for this browser session only.`}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Download size={14} />}
              onClick={() =>
                exportRows(
                  filteredRecords,
                  activeFilterCount > 0 ? 'filtered' : 'all',
                )
              }
              title={`Export ${filteredRecords.length} filtered demo records as CSV`}
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              leadingIcon={<Plus size={14} />}
              onClick={() =>
                setFormState({ mode: 'add', record: null })
              }
            >
              Add record
            </Button>
          </>
        }
        filters={
          <FilterBar
            onClear={resetFilters}
            activeCount={activeFilterCount}
          >
            <FirmFilter
              firms={SAMPLE_FIRMS}
              value={filters.firmId}
              onChange={(firmId) => updateFilters({ firmId })}
            />
            <CategoryFilter
              options={PREVIEW_CATEGORY_OPTIONS}
              value={filters.category}
              onChange={(category) => updateFilters({ category })}
            />
            <StatusFilter
              options={PREVIEW_STATUS_OPTIONS}
              value={filters.status}
              onChange={(status) => updateFilters({ status })}
            />
            <DateRangeFilter
              value={filters.dateRange}
              referenceDate={referenceDate}
              onChange={(dateRange) => updateFilters({ dateRange })}
            />
          </FilterBar>
        }
        filtersActive={activeFilterCount > 0}
        onClearFilters={resetFilters}
        search={filters.search}
        onSearchChange={(search) => updateFilters({ search })}
        searchPlaceholder="Search ID, party, firm, category..."
        searchLabel="Search demo records"
        searchFields={searchFields}
        filter={tableFilter}
        filterKey={JSON.stringify(filters)}
        selectable
        rowActions={rowActions}
        bulkActions={(selectedRows) => (
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Download size={14} />}
            onClick={() => exportRows(selectedRows, 'selected')}
          >
            Export selected
          </Button>
        )}
        initialSort={{ columnId: 'date', direction: 'desc' }}
        initialPageSize={10}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        ariaLabel="Demo records table"
        caption="Local demo records"
      />

      <p className="preview-page__note">
        Demo record IDs use the <code>DEMO-</code> prefix to keep this page
        clearly separate from production ERP modules. No Products, Sales,
        Purchases, or backend endpoints are created here.
      </p>

      {formState && (
        <RecordFormModal
          key={`${formState.mode}-${formState.record?.id ?? 'new'}`}
          mode={formState.mode}
          record={formState.record}
          onClose={() => setFormState(null)}
          onSubmit={handleSaveRecord}
        />
      )}

      {detailsRecord && (
        <RecordDetailsDrawer
          record={detailsRecord}
          onClose={() => setDetailsRecord(null)}
          onEdit={handleEditFromDetails}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        title="Delete demo record?"
        description={
          deleteTarget
            ? `${deleteTarget.id} (${deleteTarget.party}) will be removed from the local demo dataset. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete record"
        cancelLabel="Keep record"
        tone="danger"
        loading={deleting}
      />
    </div>
  )
}
