const rangerBaseApi: string = import.meta.env.MODE === 'production' ? 'https://ranger-api.rfcx.org' : 'https://staging-ranger-api.rfcx.org'

export default rangerBaseApi
