import { MenuItemConstructorOptions } from "electron";
import React, { useEffect, useState } from "react";
import Kbd from "../ui/Kbd";

const { menu, platform } = window.gato

function Command({ accelerator }) {

    if (!accelerator) {
        return <div>?</div>
    }

    return <div className="gap-2 flex items-center">
        {accelerator.split('+').map(a => <Kbd key={a}>
            {platform == 'darwin' ? a.replace('CmdOrCtrl', 'Command') : a.replace('CmdOrCtrl', 'Control')}
        </Kbd>)}
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

    // TODO: image webpack url
    return <div className="bg-stone-900 min-h-full text-center p-6 flex flex-col ">
        {/* <img src={logo} alt="logo" className="w-16 m-auto" /> */}
        <div className="mt-24 m-auto text-stone-500 flex flex-col gap-2 w-96 justify-center">
            {commands.map(({ type, label, accelerator }, index) => {

                if (type === 'separator') {
                    return <div key={type + index} className="border-b border-stone-700 my-2" />
                }

                return <div key={label} className="flex justify-between">{label}  <Command accelerator={accelerator} /> </div>
            })}
        </div>
    </div>
}

export default Home