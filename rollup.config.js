import typescript from 'rollup-plugin-typescript2'

export default {
    input: 'src/app.ts',
    output: {
        file: 'dist/app.js',
        format: 'cjs',
    },
    onwarn: (warning) => {
        if (warning.code === 'UNRESOLVED_IMPORT') return
    },
    plugins: [typescript()],
}


