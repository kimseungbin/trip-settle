import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
// import * as rds from 'aws-cdk-lib/aws-rds'

export class TripSettleStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		/*
		 * VPC INFRASTRUCTURE
		 *
		 * Basic VPC setup without NAT Gateway to minimize costs.
		 * Provides network foundation for future AWS resources.
		 *
		 * Current configuration:
		 * - 2 Availability Zones for high availability
		 * - Public and Private subnets
		 * - NO NAT Gateway (saves ~$32/month)
		 * - Internet Gateway for public subnet access
		 *
		 * Cost: ~$0/month (VPC itself is free, only data transfer charges apply)
		 */

		// VPC - No NAT Gateway to minimize costs
		const vpc = new ec2.Vpc(this, 'TripSettleVpc', {
			maxAzs: 2,
			natGateways: 0, // No NAT Gateway = no $32/month charge
		})

		// Output VPC ID for reference
		new cdk.CfnOutput(this, 'VpcId', {
			value: vpc.vpcId,
			description: 'VPC ID',
		})

		/*
		 * DATABASE INFRASTRUCTURE - CURRENTLY DISABLED
		 *
		 * This infrastructure is commented out to eliminate AWS costs (~$15-20/month).
		 * The backend currently uses pg-mem (in-memory PostgreSQL) for development,
		 * which provides full PostgreSQL compatibility with zero setup.
		 *
		 * CURRENT SETUP:
		 * - pg-mem configured in packages/backend/src/database.config.ts
		 * - Data resets on application restart (ephemeral)
		 * - Perfect for early development and testing
		 *
		 * WHEN READY FOR PRODUCTION, CHOOSE ONE OF:
		 *
		 * Option 1: Uncomment AWS RDS below (~$15-20/month)
		 *   - Managed PostgreSQL on AWS
		 *   - Automatic backups, high availability
		 *   - Requires uncommenting RDS resources below
		 *
		 * Option 2: Use free external services (0-500MB free tier)
		 *   - Neon (https://neon.tech) - 0.5GB free, serverless Postgres
		 *   - Supabase (https://supabase.com) - 500MB free, includes auth/storage
		 *   - Configure via environment variables in packages/backend/src/config/
		 *
		 * Option 3: AWS RDS Free Tier (first 12 months only)
		 *   - db.t2.micro or db.t3.micro with 20GB storage
		 *   - Free for 12 months, then ~$15-20/month
		 *   - Change instanceType below to t2.micro for free tier
		 */

		// // RDS PostgreSQL Database - Costs ~$15-20/month
		// const database = new rds.DatabaseInstance(this, 'TripSettleDatabase', {
		// 	engine: rds.DatabaseInstanceEngine.postgres({
		// 		version: rds.PostgresEngineVersion.VER_15,
		// 	}),
		// 	vpc,
		// 	vpcSubnets: {
		// 		subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
		// 	},
		// 	instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
		// 	allocatedStorage: 20,
		// 	maxAllocatedStorage: 100,
		// 	databaseName: 'tripsettle',
		// 	removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
		// 	deletionProtection: false,
		// })

		// // Output database endpoint
		// new cdk.CfnOutput(this, 'DatabaseEndpoint', {
		// 	value: database.dbInstanceEndpointAddress,
		// 	description: 'Database endpoint',
		// })
	}
}
