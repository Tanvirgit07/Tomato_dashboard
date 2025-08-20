import React from 'react'

function layout({children}: {children: React.ReactNode}) {
  return (
    <div className='mt-[80px] p-6 bg-[#E9E9E9]'>
        {children}
    </div>
  )
}

export default layout