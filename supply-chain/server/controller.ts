/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import fs from 'fs';
import { Router, Request, Response, Next } from 'express';
import util from 'util';
import { exec } from 'child_process';
import * as Web3 from 'web3';
import { authValues } from './config';

const promiseExec = util.promisify(exec);

export const deploy = async (req: Request, res: Response, next: Next) => {

  async function truffleDeploy() {
    try {
      const { stdout, stderr } = await promiseExec('truffle migrate --reset --network=vmware');

      res.json({
        data: stdout
      });

    } catch (error) {
       console.error(error);
       next(new Error(`Unexpected error when compiling contract: ${error.message}`));
    }

  }
  truffleDeploy();
};

export const checkIfDeployed = (req: Request, res: Response, next: Next): Response => {
    try {
      res.json({
        data: {buildExists:  fs.existsSync('/app/build')}
      });
    } catch (error) {
        console.error(error);
        next(new Error(`Unexpected error checking for directory: ${error.message}`));
    }
};

export const authenticate = (req: Request, res: Response, next: Next): Response => {
  try {
    const body = req.body;
    authValues.username = body.username;
    authValues.password = body.password;

    const web3 = new Web3();
    web3.setProvider(new Web3.providers.HttpProvider(authValues.genPath()));

    web3.eth.getBlock(0, (error, result) => {
      er = error;
      resul = result;

      res.json({
        data: {error:  er, result: resul}
      });
    });

  } catch (error) {
      console.error(error);
      next(new Error(`Unexpected error when authenticating: ${error.message}`));
  }
};

