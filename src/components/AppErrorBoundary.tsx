import { Component, type ErrorInfo, type ReactNode } from 'react'

type AppErrorBoundaryProps = {
  children: ReactNode
}

type AppErrorBoundaryState = {
  hasError: boolean
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application crashed in render tree', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.assign('/')
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <section className="section app-error-boundary">
        <div className="container app-error-boundary-content">
          <h1>Something went wrong</h1>
          <p>The page crashed unexpectedly. You can refresh or return to the home page.</p>
          <div className="app-error-boundary-actions">
            <button type="button" className="btn btn-primary" onClick={this.handleReload}>
              Refresh page
            </button>
            <button type="button" className="btn btn-secondary" onClick={this.handleGoHome}>
              Go to home
            </button>
          </div>
        </div>
      </section>
    )
  }
}
