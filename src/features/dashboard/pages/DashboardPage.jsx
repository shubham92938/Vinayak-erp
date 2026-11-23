import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button, Card, CardBody, useToast } from '../../../components/ui'
import { SAMPLE_FIRMS } from '../../../config/firms'
import DashboardHeader from '../components/DashboardHeader'
import DashboardSkeleton from '../components/DashboardSkeleton'
import FirmPerformanceChart from '../components/FirmPerformanceChart'
import InventoryAlerts from '../components/InventoryAlerts'
import KpiGrid from '../components/KpiGrid'
import PaymentCollectionChart from '../components/PaymentCollectionChart'
import PendingOrders from '../components/PendingOrders'
import RecentTransactions from '../components/RecentTransactions'
import RevenueExpenseChart from '../components/RevenueExpenseChart'
import SalesOverviewChart from '../components/SalesOverviewChart'
import TopCustomers from '../components/TopCustomers'
import TopProductsChart from '../components/TopProductsChart'
import UpcomingPayments from '../components/UpcomingPayments'
import { fetchDashboardData } from '../services/dashboardService'
import {
  PAYMENT_STATUSES,
  TRANSACTION_TYPES,
} from '../utils/dashboardConfig'
import {
  DEFAULT_DATE_PRESET,
  formatRangeLabel,
  getFinancialYearOptions,
  getPreviousRange,
  resolveDateRange,
  startOfDay,
  toISODate,
} from '../utils/dateRange'
import { downloadTransactionsCsv } from '../utils/csv'
import './DashboardPage.css'

const DEFAULT_TRANSACTION_FILTERS = {
  search: '',
  type: 'all',
  status: 'all',
}

export default function DashboardPage() {
  const toast = useToast()
  const referenceDate = useMemo(() => new Date(), [])
  const financialYearOptions = useMemo(
    () => getFinancialYearOptions(referenceDate, 3),
    [referenceDate],
  )
  const todayISO = toISODate(startOfDay(referenceDate))
  const minDate = `${financialYearOptions.at(-1).value}-04-01`
  const defaultRange = useMemo(
    () =>
      resolveDateRange(DEFAULT_DATE_PRESET, {
        financialYear: financialYearOptions[0].value,
        referenceDate,
      }),
    [financialYearOptions, referenceDate],
  )
  const defaultFilters = useMemo(
    () => ({
      preset: DEFAULT_DATE_PRESET,
      financialYear: financialYearOptions[0].value,
      firmId: 'all',
      customStart: defaultRange.start,
      customEnd: defaultRange.end,
    }),
    [defaultRange, financialYearOptions],
  )

  const [filters, setFilters] = useState(defaultFilters)
  const [transactionFilters, setTransactionFilters] = useState(
    DEFAULT_TRANSACTION_FILTERS,
  )
  const [data, setData] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const requestIdRef = useRef(0)

  const appliedRange = useMemo(
    () =>
      resolveDateRange(filters.preset, {
        financialYear: filters.financialYear,
        customStart: filters.customStart,
        customEnd: filters.customEnd,
        referenceDate,
      }),
    [filters, referenceDate],
  )
  const previousRange = useMemo(
    () => getPreviousRange(appliedRange.start, appliedRange.end),
    [appliedRange],
  )
  const rangeLabel = formatRangeLabel(appliedRange.start, appliedRange.end)
  const previousRangeLabel = formatRangeLabel(
    previousRange.start,
    previousRange.end,
  )
  const dataMatchesFilters = Boolean(
    data &&
      data.scope.startDate === appliedRange.start &&
      data.scope.endDate === appliedRange.end &&
      data.scope.firmId === filters.firmId,
  )
  const waitingForData = !loadError && (!data || !dataMatchesFilters)
  const isBusy = refreshing || waitingForData

  const loadDashboard = useCallback(
    async ({ announce = false } = {}) => {
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId

      try {
        const result = await fetchDashboardData({
          startDate: appliedRange.start,
          endDate: appliedRange.end,
          firmId: filters.firmId,
          financialYear: filters.financialYear,
        })

        if (requestIdRef.current !== requestId) return

        setData(result)

        if (announce) {
          toast.success('Dashboard refreshed', {
            description: `Showing data for ${result.scope.rangeLabel}.`,
          })
        }
      } catch (cause) {
        if (requestIdRef.current !== requestId) return

        setLoadError(
          cause instanceof Error
            ? cause.message
            : 'The dashboard could not be loaded.',
        )

        if (announce) {
          toast.error('Dashboard refresh failed', {
            description: 'Please try again in a moment.',
          })
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setRefreshing(false)
        }
      }
    },
    [
      appliedRange.start,
      appliedRange.end,
      filters.firmId,
      filters.financialYear,
      toast,
    ],
  )

  useEffect(() => {
    // Data fetching is synchronized with the resolved filter range. The
    // request settles asynchronously, so this cannot cascade renders.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard()

    return () => {
      requestIdRef.current += 1
    }
  }, [loadDashboard])

  const handleFilterChange = (patch) => {
    setLoadError(null)
    setFilters((current) => {
      const next = { ...current, ...patch }

      if (patch.preset === 'custom' && current.preset !== 'custom') {
        next.customStart = appliedRange.start
        next.customEnd = appliedRange.end
      }

      if (
        patch.financialYear &&
        patch.financialYear !== current.financialYear &&
        patch.preset === undefined
      ) {
        next.preset = 'fy'
      }

      if ('customStart' in patch) {
        next.customStart = patch.customStart || appliedRange.start
        if (next.customStart > next.customEnd) {
          next.customEnd = next.customStart
        }
      }

      if ('customEnd' in patch) {
        next.customEnd = patch.customEnd || appliedRange.end
        if (next.customEnd < next.customStart) {
          next.customStart = next.customEnd
        }
      }

      return next
    })
  }

  const handleReset = () => {
    setLoadError(null)
    setFilters(defaultFilters)
    setTransactionFilters(DEFAULT_TRANSACTION_FILTERS)
  }

  const canReset =
    filters.preset !== defaultFilters.preset ||
    filters.firmId !== defaultFilters.firmId ||
    filters.financialYear !== defaultFilters.financialYear ||
    (filters.preset === 'custom' &&
      (filters.customStart !== defaultFilters.customStart ||
        filters.customEnd !== defaultFilters.customEnd))

  const filteredTransactions = useMemo(() => {
    if (!data) return []

    const query = transactionFilters.search.trim().toLowerCase()

    return data.transactions.filter((transaction) => {
      if (
        transactionFilters.type !== 'all' &&
        transaction.type !== transactionFilters.type
      ) {
        return false
      }

      if (
        transactionFilters.status !== 'all' &&
        transaction.status !== transactionFilters.status
      ) {
        return false
      }

      if (!query) return true

      const haystack = [
        transaction.id,
        transaction.date,
        transaction.party,
        transaction.firmName,
        TRANSACTION_TYPES[transaction.type]?.label,
        PAYMENT_STATUSES[transaction.status]?.label,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [data, transactionFilters])

  const handleRefresh = () => {
    if (isBusy) return
    setLoadError(null)
    setRefreshing(true)
    loadDashboard({ announce: true })
  }

  const handleRetry = () => {
    setLoadError(null)
    loadDashboard()
  }

  const handleExport = () => {
    if (!data) return

    if (filteredTransactions.length === 0) {
      toast.warning('Nothing to export', {
        description:
          'No transactions match the current table filters. Adjust them and try again.',
      })
      return
    }

    try {
      const result = downloadTransactionsCsv(filteredTransactions, {
        startDate: data.scope.startDate,
        endDate: data.scope.endDate,
      })

      toast.success('CSV exported', {
        description: `${result.count} filtered transactions saved to ${result.filename}.`,
      })
    } catch {
      toast.error('Export failed', {
        description: 'The CSV file could not be generated in this browser.',
      })
    }
  }

  const showInitialSkeleton = !data && !loadError
  const demoLabel = data?.meta?.label ?? 'Demo data'
  const demoNotice =
    data?.meta?.notice ??
    'Demo values are loaded locally and are not live business data.'

  return (
    <div className="dashboard-page">
      <DashboardHeader
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        canReset={canReset}
        financialYearOptions={financialYearOptions}
        firms={SAMPLE_FIRMS}
        minDate={minDate}
        maxDate={todayISO}
        rangeLabel={rangeLabel}
        previousRangeLabel={previousRangeLabel}
        lastUpdated={data?.lastUpdated}
        loading={isBusy}
        refreshing={refreshing}
        refreshDisabled={isBusy}
        exportDisabled={!data || isBusy}
        onRefresh={handleRefresh}
        onExport={handleExport}
        exportCount={filteredTransactions.length}
        demoLabel={demoLabel}
        demoNotice={demoNotice}
      />

      {loadError && !data ? (
        <Card className="dash-error">
          <CardBody className="dash-error__body">
            <span className="dash-error__icon" aria-hidden="true">
              <AlertCircle size={20} />
            </span>
            <div className="dash-error__copy">
              <h2>Dashboard data could not be loaded</h2>
              <p>{loadError}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRetry}
            >
              Try again
            </Button>
          </CardBody>
        </Card>
      ) : showInitialSkeleton ? (
        <DashboardSkeleton />
      ) : data ? (
        <>
          {loadError && (
            <div className="dash-error-banner" role="alert">
              <AlertCircle size={15} aria-hidden="true" />
              <span>{loadError}</span>
              <Button variant="link" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          )}

          <div
            className={[
              'dashboard-body',
              isBusy && 'dashboard-body--updating',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-busy={isBusy}
          >
            <section aria-label="Business performance indicators">
              <KpiGrid kpis={data.kpis} />
            </section>

            <section
              className="dash-charts-grid"
              aria-label="Analytics charts"
            >
              <SalesOverviewChart
                data={data.salesOverview}
                currentLabel={rangeLabel}
              />
              <RevenueExpenseChart
                data={data.revenueExpense}
                currentLabel={rangeLabel}
              />
              <PaymentCollectionChart
                data={data.paymentCollection}
                currentLabel={rangeLabel}
              />
              <TopProductsChart products={data.topProducts} />
              <FirmPerformanceChart
                firms={data.firmPerformance}
                currentLabel={rangeLabel}
                className="dash-chart-card--wide"
              />
            </section>

            <div className="dash-lower-grid">
              <RecentTransactions
                transactions={filteredTransactions}
                totalCount={data.transactions.length}
                filters={transactionFilters}
                onFilterChange={(patch) =>
                  setTransactionFilters((current) => ({
                    ...current,
                    ...patch,
                  }))
                }
                onResetFilters={() =>
                  setTransactionFilters(DEFAULT_TRANSACTION_FILTERS)
                }
                rangeLabel={rangeLabel}
              />
              <InventoryAlerts inventory={data.inventory} />
            </div>

            <div className="dash-bottom-grid">
              <TopCustomers customers={data.topCustomers} />
              <PendingOrders orders={data.pendingOrders} />
              <UpcomingPayments payments={data.upcomingPayments} />
            </div>

            <p className="dashboard__notice">{demoNotice}</p>
          </div>
        </>
      ) : (
        <Card className="dash-error">
          <CardBody className="dash-error__body">
            <span className="dash-error__icon" aria-hidden="true">
              <AlertCircle size={20} />
            </span>
            <div className="dash-error__copy">
              <h2>No dashboard data available</h2>
              <p>Refresh the dashboard to try loading the demo dataset again.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
