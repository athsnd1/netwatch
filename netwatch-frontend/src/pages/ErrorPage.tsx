import { isRouteErrorResponse, useRouteError } from "react-router-dom"

export default function ErrorPage() {

    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return(
            <div className="h-dvh flex items-center justify-center bg-bgcol gap-2">
                <h1 className="font-brains text-red-600">{error.status} Error:</h1>
                <p className="font-space text-lg">{error.statusText}</p>
                {error.data?.message && <p>{error.data.message}</p>}
            </div>
        )
    }

    if (error instanceof Error) {
        return(
            <div className="h-dvh flex flex-col items-center justify-center gap-3 bg-bgcol">
                <h1 className="font-brains">Oops! Something went wrong:</h1>

                <h2 className="text-lg font-space text-red-600">{error.message}</h2>
            </div>
        )
    }

  return (
    <h1 className="h-dvh flex items-center justify-center bg-bgcol text-xl font-brains text-red-600">Oops! Something went wrong</h1>
  )
}
