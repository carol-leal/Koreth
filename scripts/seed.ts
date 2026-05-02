import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { seed } from '../src/endpoints/seed'

const main = async () => {
  const payload = await getPayload({ config })
  await seed({ payload })
  // eslint-disable-next-line no-console
  console.log('\nSeed complete. Logins:')
  console.log('  nora@koreth.tale  · admin (DM)')
  console.log('  dani@koreth.tale  · player (Ashryn Vael)')
  console.log('  mateo@koreth.tale · player (Halren Stoke)')
  console.log('  priya@koreth.tale · player (Veska Tho)')
  console.log('  sam@koreth.tale   · player (Drevan Kor)')
  console.log('  password (all):    koreth')
  process.exit(0)
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
  process.exit(1)
})
