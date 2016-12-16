class PreferencesModal extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            service: this.props.service
        }
    }

    openResetPassword() {
        $('#modal').trigger('openresetpassword');
    }

    componentWillMount() { }

    componentDidMount() {
        if ( this.state.service && !this.state.service.disabled_at) {
            $(this.checkDrive).attr('checked', true);
        } else {

        }
    }

    checkboxChange() {
        var self = this;
        var selected = $(this.checkDrive).is(':checked');
        if ( selected ) {
            var url = config.gdriveAuthURL;
            var newWindow = window.open(url, 'name', 'height=600,width=900');

            if (window.focus) {
                newWindow.focus();
            }
            var interval = setInterval(function () {
                if (newWindow.closed) {
                    APP.USER.loadUserData().done(function () {
                        var service = APP.USER.getDefaultConnectedService();
                        if ( service ) {
                            self.setState({
                                service: service
                            });
                        } else {
                            $(self.checkDrive).attr('checked', false);
                        }
                    });
                    clearInterval(interval);
                }
            }, 600);
        } else {
            if ( APP.USER.STORE.connected_services.length ) {
                this.disableGDrive().done(function (data) {
                    APP.USER.upsertConnectedService(data.connected_service);
                    self.setState({
                        service: APP.USER.getDefaultConnectedService()
                    });
                });
            }
        }

    }

    disableGDrive() {
        return $.post('/api/app/connected_services/' + this.state.service.id, { disabled: true } );

    }

    logoutUser() {
        $.post('/api/app/user/logout',function(data){
            if ($('body').hasClass('manage')) {
                location.href = config.hostpath + config.basepath;
            } else {
                window.location.reload();
            }
        });
    }

    render() {
        var gdriveMessage = '';
        if (this.props.showGDriveMessage) {
            gdriveMessage = <div className="preference-modal-message">
                Connect your Google account to translate files in your Google Drive
            </div>;
        }

        var services_label = 'Connect your Google account to translate files in Google Drive';
        if ( this.state.service && !this.state.service.disabled_at) {
            services_label = 'Connected to Google Drive ('+ this.state.service.email+')';
        }
        var resetPasswordHtml = '';
        if ( this.props.user.has_password ) {
            resetPasswordHtml = <a className="reset-password pull-left"
                                   onClick={this.openResetPassword.bind(this)}>Reset Password</a>;

        }
        return <div className="preferences-modal">
                    <div className="user-info-form">
                        
                            <strong>{this.props.user.first_name} {this.props.user.last_name}</strong><br/>
                        <span className="grey-txt">{this.props.user.email}</span><br/>
                    </div>
                    <div className="user-reset-password">
                        {gdriveMessage}
                       
                    </div>
                    <h2>Google Drive</h2>
                    <div className="user-gdrive">
                    
                        <div className="onoffswitch-drive">
                            <input type="checkbox" name="onoffswitch" onChange={this.checkboxChange.bind(this)}
                                   ref={(input) => this.checkDrive = input}
                                   className="onoffswitch-checkbox" id="gdrive_check"/>
                            <label className="onoffswitch-label" htmlFor="gdrive_check">
                                <span className="onoffswitch-inner"/>
                                <span className="onoffswitch-switch"/>
                                <span className="onoffswitch-label-status-active">ON</span>
                                <span className="onoffswitch-label-status-inactive">OFF</span>
                                <span className="onoffswitch-label-status-unavailable">Unavailable</span>
                            </label>
                        </div>
                        <label>{services_label}</label>
                    </div>
                    <br/>
                     {resetPasswordHtml}
                    <div id='logoutlink' className="pull-left" onClick={this.logoutUser.bind(this)}>Logout</div>
            </div>;
    }
}

export default PreferencesModal ;