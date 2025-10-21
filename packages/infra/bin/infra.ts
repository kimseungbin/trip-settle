#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { TripSettleStack } from '../lib/trip-settle-stack'

const app = new cdk.App()

new TripSettleStack(app, 'TripSettleStack', {
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: process.env.CDK_DEFAULT_REGION,
	},
	description: 'Trip Settle application infrastructure',
})
