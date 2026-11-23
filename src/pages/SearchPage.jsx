import { Link, useSearchParams } from 'react-router-dom'
import { Search, SearchX } from 'lucide-react'
import { Button, Card, CardBody, Input } from '../components/ui'
import './PlaceholderPage.css'
import './SearchPage.css'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextQuery = event.currentTarget.elements.q.value.trim()

    if (nextQuery && nextQuery !== query) {
      setSearchParams({ q: nextQuery })
    } else if (!nextQuery) {
      setSearchParams({})
    }
  }

  return (
    <div className="page search-page">
      <header className="page-header">
        <div className="page-header__text">
          <p className="page-eyebrow">Workspace</p>
          <h1 className="page-title">Search</h1>
          <p className="page-description">
            Search will span firms, customers, products, documents, and ledger
            entries once the modules contain data.
          </p>
        </div>
      </header>

      <form className="search-page__form" role="search" onSubmit={handleSubmit}>
        <Input
          key={query}
          size="lg"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search the workspace"
          aria-label="Search the workspace"
          leadingIcon={<Search size={16} />}
        />
        <Button type="submit">Search</Button>
      </form>

      <Card className="search-page__result">
        <CardBody className="search-page__state">
          <span className="search-page__icon" aria-hidden="true">
            {query ? <SearchX size={20} /> : <Search size={20} />}
          </span>

          {query ? (
            <>
              <h2 className="search-page__title">
                No indexed results for “{query}”
              </h2>
              <p className="search-page__description">
                Global search is not connected to data yet. Your query is kept
                in the address bar so it can be wired to real records later.
              </p>
            </>
          ) : (
            <>
              <h2 className="search-page__title">Search across the workspace</h2>
              <p className="search-page__description">
                Enter a term above to preview the search destination. Results
                will appear here when the data modules are implemented.
              </p>
            </>
          )}

          <Link to="/dashboard" className="search-page__link">
            Return to overview
          </Link>
        </CardBody>
      </Card>
    </div>
  )
}
