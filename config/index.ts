const rangerBaseApi: string = import.meta.env.MODE === 'production' ? 'https://guardian-api.rfcx.org' : 'https://staging-guardian-api.rfcx.org'

export default rangerBaseApi
