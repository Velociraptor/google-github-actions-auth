// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { getBooleanInput, setFailed, info as logInfo } from '@actions/core';
import { errorMessage, forceRemove } from '@google-github-actions/actions-utils';

/**
 * Executes the post action, documented inline.
 */
export async function run(): Promise<void> {
  try {
    const createCredentials = getBooleanInput('create_credentials_file');
    if (!createCredentials) {
      logInfo(`Skipping credential cleanup - "create_credentials_file" is false.`);
      return;
    }

    const cleanupCredentials = getBooleanInput('cleanup_credentials');
    if (!cleanupCredentials) {
      logInfo(`Skipping credential cleanup - "cleanup_credentials" is false.`);
      return;
    }

    // Look up the credentials path, if one exists. Note that we only check the
    // environment variable set by our action, since we don't want to
    // accidentially clean up if someone set GOOGLE_APPLICATION_CREDENTIALS or
    // another environment variable manually.
    const credentialsPath = process.env['GOOGLE_GHA_CREDS_PATH'];
    if (!credentialsPath) {
      logInfo(`Skipping credential cleanup - $GOOGLE_GHA_CREDS_PATH is not set.`);
      return;
    }

    // Remove the file.
    await forceRemove(credentialsPath);
    logInfo(`Removed exported credentials at "${credentialsPath}".`);
  } catch (err) {
    const msg = errorMessage(err);
    setFailed(`google-github-actions/auth post failed with: ${msg}`);
  }
}

run();
