# ERC20 Multiple Dapp Script

## Steps to run
1. Inside `/erc20-load-test-tool` directory run
```bash
  mvn clean install
```
2. Navigate to `script` folder
```bash
  cd script
```
3. Edit `.env` file, to change ENVIRONMENT variable values
```bash
  vi .env
```
4. Load ENVIRONMENT variables
```bash
  source .env
```
5. Run the script
```bash
  python run-dapp.py
```
## To check Result
```bash
  cat ../output/result/aggregate-report.json
```
