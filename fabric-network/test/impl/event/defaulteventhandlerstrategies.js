/**
 * Copyright 2018 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

const EventHubFactory = require('fabric-network/lib/impl/event/eventhubfactory');
const ChannelEventHub = require('fabric-client').ChannelEventHub;
const Network = require('fabric-network/lib/network');
const Channel = require('fabric-client').Channel;
const AllForTxStrategy = require('fabric-network/lib/impl/event/allfortxstrategy');
const AnyForTxStrategy = require('fabric-network/lib/impl/event/anyfortxstrategy');
const TransactionEventHandler = require('fabric-network/lib/impl/event/transactioneventhandler');

const EventStrategies = require('fabric-network/lib/impl/event/defaulteventhandlerstrategies');

describe('DefaultEventHandlerStrategies', () => {
	const transactionId = 'TRANSACTION_ID';
	const expectedStrategyTypes = {
		'MSPID_SCOPE_ALLFORTX': AllForTxStrategy,
		'MSPID_SCOPE_ANYFORTX': AnyForTxStrategy,
		'NETWORK_SCOPE_ALLFORTX': AllForTxStrategy,
		'NETWORK_SCOPE_ANYFORTX': AnyForTxStrategy
	};
	const strategyNames = Object.keys(expectedStrategyTypes);

	let options;
	let stubNetwork;

	beforeEach(() => {
		options = {
			commitTimeout: 418,
			banana: 'man'
		};

		const stubPeer = {
			_stubInfo: 'peer',
			getName: function() {
				return 'peer';
			}
		};

		const stubEventHub = sinon.createStubInstance(ChannelEventHub);
		stubEventHub.isconnected.returns(true);

		const stubEventHubFactory = sinon.createStubInstance(EventHubFactory);
		stubEventHubFactory.getEventHubs.withArgs([stubPeer]).resolves([stubEventHub]);

		const channel = sinon.createStubInstance(Channel);
		channel.getPeers.returns([stubPeer]);
		channel.getPeersForOrg.returns([stubPeer]);

		stubNetwork = sinon.createStubInstance(Network);
		stubNetwork.getChannel.returns(channel);
		stubNetwork.getEventHubFactory.returns(stubEventHubFactory);
	});

	afterEach(() => {
		sinon.restore();
	});

	strategyNames.forEach((strategyName) => describe(strategyName, () => {
		const createTxEventHandler = EventStrategies[strategyName];

		let eventHandler;

		beforeEach(() => {
			eventHandler = createTxEventHandler(transactionId, stubNetwork, options);
		});

		it('Returns a TransactionEventHandler', () => {
			expect(eventHandler).to.be.an.instanceOf(TransactionEventHandler);
		});

		it('Sets transaction ID on event handler', () => {
			expect(eventHandler.transactionId).to.equal(transactionId);
		});

		it('Sets options on event handler', () => {
			expect(eventHandler.options).to.include(options);
		});

		it('Sets correct strategy on event handler', () => {
			const expectedType = expectedStrategyTypes[strategyName];
			expect(eventHandler.strategy).to.be.an.instanceOf(expectedType);
		});
	}));
});
