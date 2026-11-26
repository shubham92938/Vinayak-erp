import { useState } from 'react'
import {
  Archive,
  ArrowUpRight,
  Building2,
  ChevronDown,
  Copy,
  Download,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
  Input,
  Loader,
  Modal,
  Select,
  useToast,
} from '../components/ui'
import ThemeToggle from '../components/theme/ThemeToggle'
import './DesignSystemPage.css'

const PALETTE = [
  { name: 'Primary navy', token: '--color-navy', value: '#172B4D' },
  { name: 'Primary blue', token: '--color-blue', value: '#2563EB' },
  { name: 'Background', token: '--color-background', value: '#F6F8FA' },
  { name: 'Surface', token: '--color-surface', value: '#FFFFFF' },
  { name: 'Surface subtle', token: '--color-surface-subtle', value: '#F8FAFC' },
  { name: 'Text secondary', token: '--color-text-secondary', value: '#64748B' },
  { name: 'Border', token: '--color-border', value: '#E5E9F0' },
  { name: 'Success', token: '--color-success', value: '#16865B' },
  { name: 'Warning', token: '--color-warning', value: '#D99A24' },
  { name: 'Danger', token: '--color-danger', value: '#DC4545' },
]

const SPACING = [4, 8, 12, 16, 24, 32, 40]

const RADII = [
  { label: '3px', value: 'var(--radius-xs)' },
  { label: '4px', value: 'var(--radius-sm)' },
  { label: '6px', value: 'var(--radius-md)' },
  { label: '8px', value: 'var(--radius-lg)' },
  { label: '10px', value: 'var(--radius-xl)' },
]

const FIRM_TYPES = [
  { value: 'private-limited', label: 'Private Limited' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'Limited Liability Partnership' },
  { value: 'proprietorship', label: 'Proprietorship' },
]

const NOTIFICATIONS = [
  {
    label: 'Success',
    variant: 'success',
    title: 'Changes saved',
    description: 'Your updates are now available across the workspace.',
  },
  {
    label: 'Warning',
    variant: 'warning',
    title: 'Review required',
    description: 'Two fields need attention before this record can be published.',
  },
  {
    label: 'Error',
    variant: 'error',
    title: 'Import failed',
    description: 'The file could not be processed. Check the format and try again.',
  },
  {
    label: 'Info',
    variant: 'info',
    title: 'New update available',
    description: 'Refresh the page to load the latest workspace changes.',
  },
]

function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const closeModal = () => setIsModalOpen(false)

  return (
    <div className="ds-shell">
      <header className="ds-topbar">
        <div className="ds-topbar__inner">
          <div className="ds-brand">
            <span className="ds-brand__mark" aria-hidden="true">
              <Building2 size={15} strokeWidth={1.8} />
            </span>
            <span className="ds-brand__name">
              Vinayak <span>ERP</span>
            </span>
          </div>

          <span className="ds-topbar__divider" aria-hidden="true" />
          <span className="ds-topbar__context">Design system</span>

          <div className="ds-topbar__meta">
            <ThemeToggle />
            <Badge variant="neutral" size="sm">
              Foundation 1.0
            </Badge>
          </div>
        </div>
      </header>

      <main className="ds-main">
        <header className="ds-hero">
          <div className="ds-hero__text">
            <p className="page-eyebrow">Foundation / Visual language</p>
            <h1>Design system</h1>
            <p className="ds-lede">
              A compact, consistent interface language for every firm, ledger,
              and workflow across Vinayak ERP.
            </p>
          </div>

          <dl className="ds-specs" aria-label="Design system specifications">
            <div className="ds-spec">
              <dt>Typeface</dt>
              <dd>Inter</dd>
            </div>
            <div className="ds-spec">
              <dt>Base size</dt>
              <dd>14 px</dd>
            </div>
            <div className="ds-spec">
              <dt>Grid</dt>
              <dd>4 px</dd>
            </div>
            <div className="ds-spec">
              <dt>Icons</dt>
              <dd>Lucide</dd>
            </div>
          </dl>
        </header>

        <section className="ds-section" aria-labelledby="foundations-heading">
          <header className="ds-section__header">
            <div>
              <p className="page-eyebrow">01 / Foundations</p>
              <h2 id="foundations-heading">Visual language</h2>
            </div>
            <p className="ds-section__description">
              A restrained palette, compact type scale, and quiet surfaces keep
              dense financial workflows clear without visual noise.
            </p>
          </header>

          <div className="ds-foundation-grid">
            <Card className="ds-panel ds-panel--full">
              <CardHeader
                title="Color palette"
                description="Core tokens for brand, surfaces, text, borders, and semantic states."
              />
              <CardBody>
                <div className="ds-swatches">
                  {PALETTE.map((color) => (
                    <div
                      className="ds-swatch"
                      key={color.token}
                      title={`var(${color.token})`}
                    >
                      <div
                        className="ds-swatch__sample"
                        style={{ background: `var(${color.token})` }}
                        aria-hidden="true"
                      />
                      <p className="ds-swatch__name">{color.name}</p>
                      <p className="ds-swatch__value">{color.value}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
              <CardFooter className="ds-panel__footer">
                <span>
                  Defined once in <code>src/styles/variables.css</code> and
                  consumed by every module.
                </span>
              </CardFooter>
            </Card>

            <Card className="ds-panel">
              <CardHeader
                title="Typography"
                description="Inter at a compact scale, with strong weight contrast for hierarchy."
              />
              <CardBody>
                <div className="ds-type-list">
                  <div className="ds-type-row">
                    <p className="ds-type-sample ds-type-sample--display">
                      Firm overview
                    </p>
                    <div className="ds-type-meta">
                      <strong>Display</strong>
                      <span>28 / 600</span>
                    </div>
                  </div>

                  <div className="ds-type-row">
                    <p className="ds-type-sample ds-type-sample--heading">
                      Chart of accounts
                    </p>
                    <div className="ds-type-meta">
                      <strong>Heading</strong>
                      <span>18 / 600</span>
                    </div>
                  </div>

                  <div className="ds-type-row">
                    <p className="ds-type-sample ds-type-sample--body">
                      Every firm, one source of truth.
                    </p>
                    <div className="ds-type-meta">
                      <strong>Body</strong>
                      <span>14 / 400</span>
                    </div>
                  </div>

                  <div className="ds-type-row">
                    <p className="ds-type-sample ds-type-sample--caption">
                      Accounting period
                    </p>
                    <div className="ds-type-meta">
                      <strong>Caption</strong>
                      <span>11 / 600</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="ds-panel">
              <CardHeader
                title="Spacing and radius"
                description="A 4px spacing grid and a restrained radius scale for controls and surfaces."
              />
              <CardBody>
                <div className="ds-token-block">
                  <p className="ds-token-heading">Spacing / 4px base</p>
                  <div className="ds-spacing-list">
                    {SPACING.map((value) => (
                      <div className="ds-spacing-row" key={value}>
                        <span className="ds-spacing-label">{value}</span>
                        <span
                          className="ds-spacing-bar"
                          style={{ width: `${value}px` }}
                          aria-hidden="true"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ds-token-block">
                  <p className="ds-token-heading">Radius</p>
                  <div className="ds-radius-list">
                    {RADII.map((radius) => (
                      <div className="ds-radius-item" key={radius.label}>
                        <span
                          className="ds-radius-shape"
                          style={{ borderRadius: radius.value }}
                          aria-hidden="true"
                        />
                        <span className="ds-radius-label">{radius.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        <section className="ds-section" aria-labelledby="components-heading">
          <header className="ds-section__header">
            <div>
              <p className="page-eyebrow">02 / Components</p>
              <h2 id="components-heading">Interface primitives</h2>
            </div>
            <p className="ds-section__description">
              Shared controls for actions, input, status, and overlays. Every
              component consumes the same tokens and interaction states.
            </p>
          </header>

          <div className="ds-component-grid">
            <Card className="ds-panel ds-panel--full">
              <CardHeader
                title="Buttons"
                description="One primary action per group, quiet secondary controls, and explicit destructive styling."
                actions={
                  <Badge variant="neutral" size="sm">
                    5 variants
                  </Badge>
                }
              />
              <CardBody>
                <div className="ds-demo-group">
                  <span className="ds-demo-label">Variants</span>
                  <div className="ds-demo-row">
                    <Button leadingIcon={<Plus size={15} />}>Primary</Button>
                    <Button
                      variant="secondary"
                      leadingIcon={<Download size={15} />}
                    >
                      Secondary
                    </Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button
                      variant="danger"
                      leadingIcon={<Trash2 size={15} />}
                    >
                      Danger
                    </Button>
                    <Button
                      variant="link"
                      trailingIcon={<ArrowUpRight size={14} />}
                    >
                      Link action
                    </Button>
                  </div>
                </div>

                <div className="ds-demo-group">
                  <span className="ds-demo-label">Sizes and states</span>
                  <div className="ds-demo-row">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <span className="ds-demo-divider" aria-hidden="true" />
                    <Button
                      variant="secondary"
                      iconOnly
                      aria-label="Settings"
                    >
                      <Settings2 size={16} />
                    </Button>
                    <Button variant="secondary" loading>
                      Loading
                    </Button>
                    <Button variant="secondary" disabled>
                      Disabled
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="ds-panel">
              <CardHeader
                title="Form controls"
                description="Labels, hints, errors, and focus states share one geometry."
              />
              <CardBody>
                <div className="ds-form-stack">
                  <Input
                    label="Quick search"
                    placeholder="Search firms, ledgers, or records"
                    leadingIcon={<Search size={15} />}
                  />

                  <Input
                    label="Work email"
                    type="email"
                    placeholder="name@company.com"
                    hint="Invitations are sent to this address."
                  />

                  <Select
                    label="Firm type"
                    placeholder="Select a firm type"
                    options={FIRM_TYPES}
                  />

                  <Input
                    label="GSTIN"
                    placeholder="27AABCU9603R1ZM"
                    error="Enter a valid 15-character GSTIN."
                  />
                </div>
              </CardBody>
            </Card>

            <Card className="ds-panel">
              <CardHeader
                title="Status and feedback"
                description="Small, consistent signals for record state and system events."
              />
              <CardBody>
                <div className="ds-demo-group">
                  <span className="ds-demo-label">Badges</span>
                  <div className="ds-demo-row">
                    <Badge variant="success" dot>
                      Active
                    </Badge>
                    <Badge variant="warning" dot>
                      Pending
                    </Badge>
                    <Badge variant="danger" dot>
                      Overdue
                    </Badge>
                    <Badge variant="info">Draft</Badge>
                    <Badge>Archived</Badge>
                  </div>
                </div>

                <div className="ds-demo-group">
                  <span className="ds-demo-label">Loaders</span>
                  <div className="ds-loader-row">
                    <Loader size="sm" showLabel label="Syncing" />
                    <Loader size="md" showLabel label="Loading data" />
                  </div>
                </div>

                <div className="ds-demo-group">
                  <span className="ds-demo-label">Notifications</span>
                  <div className="ds-demo-row">
                    {NOTIFICATIONS.map((notification) => (
                      <Button
                        key={notification.variant}
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          toast({
                            variant: notification.variant,
                            title: notification.title,
                            description: notification.description,
                          })
                        }
                      >
                        {notification.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="ds-panel ds-panel--full">
              <CardHeader
                title="Menus and overlays"
                description="Contextual actions and dialogs use the same elevation, border, and focus treatment."
              />
              <CardBody>
                <div className="ds-overlay-list">
                  <div className="ds-overlay-row">
                    <div className="ds-overlay-copy">
                      <p className="ds-overlay-title">Dropdown menu</p>
                      <p className="ds-overlay-description">
                        Use for contextual row actions. Supports keyboard
                        navigation, separators, icons, and shortcuts.
                      </p>
                    </div>

                    <Dropdown align="end" menuLabel="Record actions">
                      <DropdownTrigger
                        variant="secondary"
                        trailingIcon={<ChevronDown size={14} />}
                      >
                        Actions
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownLabel>Record</DropdownLabel>
                        <DropdownItem icon={<Pencil size={15} />} shortcut="⌘E">
                          Rename
                        </DropdownItem>
                        <DropdownItem icon={<Copy size={15} />} shortcut="⌘D">
                          Duplicate
                        </DropdownItem>
                        <DropdownItem icon={<Archive size={15} />}>
                          Archive
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem danger icon={<Trash2 size={15} />}>
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  <div className="ds-overlay-row">
                    <div className="ds-overlay-copy">
                      <p className="ds-overlay-title">Dialog</p>
                      <p className="ds-overlay-description">
                        A focused surface for short tasks and confirmations,
                        with escape handling and focus containment.
                      </p>
                    </div>

                    <Button onClick={() => setIsModalOpen(true)}>
                      Open dialog
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>
      </main>

      <footer className="ds-footer">
        <span>Vinayak ERP · Design foundation</span>
        <span>Inter · Lucide · Plain CSS</span>
      </footer>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title="Dialog preview"
        description="A focused surface for short tasks, confirmations, and compact forms."
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={closeModal}>Done</Button>
          </>
        }
      >
        <div className="ds-modal-content">
          <p className="ds-modal-copy">
            Dialogs keep the user in context for one decision at a time. The
            shared primitive manages focus, body scroll, and keyboard dismissal.
          </p>

          <Input
            label="Example field"
            placeholder="Try the focus state"
            data-autofocus
          />

          <p className="ds-modal-note">
            Visual demonstration only — no data is stored.
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default DesignSystemPage
