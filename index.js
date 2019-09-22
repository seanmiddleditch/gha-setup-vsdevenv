const core = require('@actions/core')
const process = require('process')
const path = require('path')
const spawn = require('child_process').spawnSync

try {
    // this job has nothing to do on non-Windows platforms
    if (process.platform != 'win32') {
        process.exit(0);
    }

    const arch = core.getInput('arch') || 'amd64'
    const vswhere = core.getInput('vswhere') || 'vswhere.exe'
    const components = core.getInput('components') || 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64'

    const vsInstallerPath = path.win32.join(process.env['ProgramFiles(x86)'], 'Microsoft Visual Studio', 'Installer')
    const vswherePath = path.win32.resolve(vsInstallerPath, vswhere)

    console.log(`vswhere: ${vswherePath}`)

    const requiresArg = components
        .split(';')
        .map(comp => ['-requires', comp])
        .reduce((arr, pair) => arr.concat(pair), [])

    const vswhereArgs = [
        '-latest',
        '-products', '*',
    ].concat(requiresArg, [
        '-property', 'installationPath'
    ])

    const vswhereResult = spawn(vswherePath, vswhereArgs, {encoding: 'utf8'})
    if (vswhereResult.error) throw vswhereResult.error
    const installPathList = vswhereResult.output.filter(s => !!s).map(s => s.trim())
    if (installPathList.length == 0) throw new Error('Could not find compatible VS installation')

    const installPath = installPathList[installPathList.length - 1]
    console.log(`install: ${installPath}`)

    const vsDevCmdPath = path.win32.join(installPath, 'Common7', 'Tools', 'vsdevcmd.bat')
    console.log(`vsdevcmd: ${vsDevCmdPath}`)

    const cmdArgs = [
        '/q', '/k',
        vsDevCmdPath, `-arch=${arch}`,
        '&&', 'set'
    ]

    const cmdResult = spawn('cmd', cmdArgs, {encoding: 'utf8'})
    if (cmdResult.error) throw cmdResult.error
    const cmdOutput = cmdResult.output
        .filter(s => !!s)
        .map(s => s.split('\n'))
        .reduce((arr, sub) => arr.concat(sub), [])
        .filter(s => !!s)
        .map(s => s.trim())

    const completeEnv = cmdOutput
        .filter(s => s.indexOf('=') != -1)
        .map(s => s.split('=', 2))
    const filteredEnv = completeEnv
        .filter(([key, _]) => key != 'Path' && !process.env[key])

    for (const [key, value] of filteredEnv) {
        core.exportVariable(key, value)
    }

    const pathEntries = process.env['Path'].split(';')
    const newPathEntries = completeEnv
        .filter(([key, _]) => key == 'Path')
        .map(([_, value]) => value)
        .join(';')
        .split(';')
        .filter(path => pathEntries.indexOf(path) == -1)

    for (const path of newPathEntries) {
        core.addPath(path)
    }

    console.log('environment updated')
} catch (error) {
    core.setFailed(error.message);
}
