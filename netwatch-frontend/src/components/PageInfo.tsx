

type Props = {
    prevPage: string;
    currentPage: string;
    pageTitle: string;
    pageDesc: string;
}

export default function PageInfo ({ prevPage = "prev", currentPage = "curr", pageTitle = "Page", pageDesc = "Default page." }: Props ) {


  return (
    <div className="flex flex-col items-start gap-1 ml-4 mb-8">

        <div className="flex items-center gap-1">
            <span className="text-xs text-seccol font-brains">{prevPage}</span>
            <span className="text-seccol text-xs">/</span>
            <span className="text-hovercol text-xs font-brains">{currentPage}</span>
        </div>

        <h1 className="text-2xl text-main font-semibold font-space text-textcol">{pageTitle}</h1>

        <h3 className="text-xs text-seccol font-medium font-brains">{pageDesc}</h3>

    </div>
  )
}
