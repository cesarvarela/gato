import { MenuItemConstructorOptions } from "electron";
import React, { useEffect, useState } from "react";
import logo from '../../assets/logo.png'

const { menu } = window.gato

function Command({ accelerator }) {

    if (!accelerator) {
        return <div>?</div>
    }

    return <div className="gap-2 flex items-center">
        {accelerator.split('+').map(a => <kbd className="kbd">{a}</kbd>)}
    </div>
}

function Home() {

    const [commands, setCommands] = useState<MenuItemConstructorOptions[]>([])

    useEffect(() => {

        async function fetch() {

            const { application: { submenu } } = await menu()

            setCommands(submenu as MenuItemConstructorOptions[])
        }

        fetch()
    }, [menu])

    return <div className="text-center p-6 flex flex-col ">
        <img src={logo} alt="logo" className="w-16 m-auto" />
        <div className="mt-6 m-auto text-gray-500 flex flex-col gap-2 w-96 justify-center">
            {commands.map(({ type, label, accelerator }) => {

                if (type === 'separator') {
                    return <div className="border-b border-gray-300 my-2" />
                }

                return <div key={label} className="flex justify-between">{label}  <Command accelerator={accelerator} /> </div>
            })}
        </div>
    </div>
}

export default Home