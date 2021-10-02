import { ServerConst } from './src/app/ganymede/server/src/const';
import { ServerEntryPoint } from './src/app/ganymede/server/src/servers.entrypoint';

ServerConst.setData({
  prod: false,
});

ServerEntryPoint.start();

