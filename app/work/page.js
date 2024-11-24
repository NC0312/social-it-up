import React from 'react'
import WorkGrid from './Workgrid'

function work() {
  return (
    <>
    <section className="text-center py-16">
      <div className="container mx-auto">
        <h1 className="text-9xl pt-14 font-medium text-[#2e2e2e] font-serif">
          Our Clients
        </h1>
        <p className="text-xl font-bold text-[#2e2e2e] mt-4 uppercase tracking-wider">
          And Their Story.
        </p>
      </div>
    </section>
    <WorkGrid/>
    </>
  )
}

export default work
